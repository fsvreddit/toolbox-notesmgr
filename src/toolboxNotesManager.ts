import {Comment, Context, FormField, FormOnSubmitEvent, MenuItemOnPressEvent, Post, WikiPage} from "@devvit/public-api";
import {RawSubredditConfig} from "toolbox-devvit/dist/types/RawSubredditConfig.js";
import {addUsernoteForm, viewUsernotesForm} from "./main.js";
import {ToolboxClient, UsernoteInit, decompressBlob} from "toolbox-devvit";
import {formatDistanceToNow} from "date-fns";

export async function addUsernoteForUser (event: MenuItemOnPressEvent, context: Context) {
    let target: Post | Comment | undefined;
    if (event.targetId.startsWith("t1")) {
        target = await context.reddit.getCommentById(event.targetId);
    } else if (event.targetId.startsWith("t3")) {
        target = await context.reddit.getPostById(event.targetId);
    }

    if (!target) {
        console.log(`Invalid targetId: ${event.targetId}`);
        context.ui.showToast("Error retrieving item that Add Usernote option was chosen from.");
        return;
    }

    const subreddit = await context.reddit.getCurrentSubreddit();
    let toolboxConfigPage: WikiPage | undefined;
    try {
        toolboxConfigPage = await context.reddit.getWikiPage(subreddit.name, "toolbox");
    } catch (error) {
        context.ui.showToast("Toolbox configuration page could not be found.");
        console.log("Error retrieving Toolbox configuration.");
        console.log(error);
        return;
    }

    const toolboxConfig = JSON.parse(toolboxConfigPage.content) as RawSubredditConfig;

    context.ui.showForm(addUsernoteForm, {
        fields: [
            {
                name: "notetype",
                label: "Type of note to add (optional)",
                type: "select",
                options: toolboxConfig.usernoteColors.map(noteType => ({label: noteType.text, value: noteType.key})),
                multiSelect: false,
                required: false,
            },
            {
                name: "notetext",
                label: "Text to add",
                type: "string",
                required: true,
            },
            {
                name: "includelink",
                label: `Include permalink to this ${target instanceof Post ? "post" : "comment"}`,
                type: "boolean",
                required: true,
                defaultValue: true,
            },
            {
                name: "username",
                label: "Adding usernote for user:",
                type: "string",
                disabled: true,
                defaultValue: target.authorName,
            },
            {
                name: "permalink",
                label: "Adding usernote against this permalink:",
                type: "string",
                disabled: true,
                defaultValue: target.permalink,
            },
        ],
        description: `Adding usernote for /u/${target.authorName}`,
    });
}

export async function addUsernoteHandler (event: FormOnSubmitEvent, context: Context) {
    const username = event.values.username as string | undefined;
    const noteTypeList = event.values.notetype as string[] | undefined;
    const noteText = event.values.notetext as string | undefined;
    const addPermalink = event.values.includelink as boolean | undefined;
    let permalink = event.values.permalink as string | undefined;
    if (!addPermalink) {
        permalink = undefined;
    }

    let noteType: string | undefined;
    if (noteTypeList && noteTypeList.length > 0) {
        noteType = noteTypeList[0];
    }

    if (!username) {
        context.ui.showToast("Error: Username unknown");
        return;
    }

    if (!noteText) {
        context.ui.showToast("You must provide some text to add for the usernote!");
        return;
    }

    const user = await context.reddit.getCurrentUser();
    const subreddit = await context.reddit.getCurrentSubreddit();

    const toolbox = new ToolboxClient(context.reddit);
    const usernote: UsernoteInit = {
        username,
        noteType,
        text: noteText,
        contextPermalink: permalink,
        timestamp: new Date(),
        moderatorUsername: user.username,
    };

    await toolbox.addUsernote(subreddit.name, usernote, "Added via Toolbox Notes Manager");
    context.ui.showToast("Added usernote successfully.");
}

export async function showUsernotesForUser (event: MenuItemOnPressEvent, context: Context) {
    let target: Post | Comment | undefined;
    if (event.targetId.startsWith("t1")) {
        target = await context.reddit.getCommentById(event.targetId);
    } else if (event.targetId.startsWith("t3")) {
        target = await context.reddit.getPostById(event.targetId);
    }

    if (!target) {
        context.ui.showToast("Error retrieving item that Add Usernote option was chosen from.");
        return;
    }

    const subreddit = await context.reddit.getCurrentSubreddit();
    const toolbox = new ToolboxClient(context.reddit);
    const userNotes = await toolbox.getUsernotesOnUser(subreddit.name, target.authorName);

    if (userNotes.length === 0) {
        context.ui.showToast("User has no notes.");
        return;
    }

    let toolboxConfigPage: WikiPage | undefined;
    try {
        toolboxConfigPage = await context.reddit.getWikiPage(subreddit.name, "toolbox");
    } catch (error) {
        context.ui.showToast("Toolbox configuration page could not be found.");
        return;
    }

    const toolboxConfig = JSON.parse(toolboxConfigPage.content) as RawSubredditConfig;

    const usernotesWithTags = userNotes.map(note => ({
        timestamp: note.timestamp,
        moderatorUsername: note.moderatorUsername,
        noteText: note.noteType === undefined ? note.text :
            `[${toolboxConfig.usernoteColors.find(x => x.key === note.noteType)?.text ?? "unknown"}] ${note.text}`,
    }));

    const formFields: FormField[] = usernotesWithTags.map(note => ({
        name: `usernote${note.timestamp.getTime().toString()}`,
        label: note.noteText,
        type: "boolean",
        helpText: `added ${formatDistanceToNow(note.timestamp)} ago by ${note.moderatorUsername}`,
        defaultValue: false,
    }));

    // formFields.unshift({
    //     name: "username",
    //     type: "string",
    //     label: "Deleting notes for this user",
    //     defaultValue: target.authorName,
    //     disabled: true,
    // });

    context.ui.showForm(viewUsernotesForm, {
        fields: formFields,
        description: `List of usernotes for /u/${target.authorName}. At present, you can only view notes - not delete them.`,
    });
}

export async function showUsernotesHandler (event: FormOnSubmitEvent, context: Context) {
    const userName = event.values.username as string;
    const noteResults: NoteResult[] = Object.entries(event.values).map(([key, value]) => ({
        key,
        value,
    }));

    let notesToDelete = noteResults.filter(x => x.key !== "username" && x.value === true).map(x => parseInt(x.key.replace("usernote", "")));
    if (notesToDelete.length === 0) {
        return;
    }

    const subreddit = await context.reddit.getCurrentSubreddit();
    const toolbox = new ToolboxClient(context.reddit);

    // Get all usernotes for entire subreddit.
    let allNotes = await toolbox.getUsernotes(subreddit.name);
    // Filter out any usernotes for this user that are in the list to be deleted.
    let rawUsers = decompressBlob(allNotes.toJSON().blob);
    rawUsers.

}
