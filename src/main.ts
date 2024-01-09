import {Devvit} from "@devvit/public-api";
import {addUsernoteForUser, addUsernoteHandler, showUsernotesForUser, showUsernotesHandler} from "./toolboxNotesManager.js";

Devvit.addMenuItem({
    label: "Toolbox: Add usernote for user",
    location: ["post", "comment"],
    forUserType: "moderator",
    onPress: addUsernoteForUser,
});

Devvit.addMenuItem({
    label: "Toolbox: Get usernotes for user",
    location: ["post", "comment"],
    forUserType: "moderator",
    onPress: showUsernotesForUser,
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const addUsernoteForm = Devvit.createForm(data => ({fields: data.fields}), addUsernoteHandler);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const viewUsernotesForm = Devvit.createForm(data => ({fields: data.fields, description: data.description}), showUsernotesHandler);

Devvit.configure({
    redditAPI: true,
});

export default Devvit;
