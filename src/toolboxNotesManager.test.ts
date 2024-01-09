import pako from "pako";
import { RawUsernotesUsers } from "toolbox-devvit";

interface VeryRawUsernoteUser {

}

interface VeryRawUsernotes {

}

test("Testing usernotes!", () => {
    const usernotesBlob = "eJytlstym0gUhl+FYk1quum7dkllkUVck5pxspnKooGWBTSXQANGKb/7tIQsKY2xJSUb21XmfH2u/zk//fu0+CS1ar90kU7jtDX+6qdftv7qP/vLX/l/r9fefVWnsTfIpkzLBy8aV9667f3At99CBiBgmIcw8At/BQJfWyMdQPpg2LoJcmTqR6jsx4P971NwDZTgcBk65uNtUAT+JJQKTJlgkLhQtVXpNsgB0j1pr4diHFruRdDvT4FvbY1qjdRu+b6opq1Kqb33xsg4X0wNAgAL4KaGiy6HD0EeGUVx50TxUUmz+etbWmlVxmqRDADhQrj5YU3CyirIBS2r1M3P/aZRykvk6A2N7ch3rZb1LEVEMAYod1NU4xyiIA8VqVl2I5cwOGuS17ifpFHev7VS8WaxopbJOUJLWBENInGwUWW8SJZe16qmrIw6shBAOIQzFoCChhMDPjPuqmRn6g2p2VSd8XRa5kdOKAjE4JfSTObhS+Z7W0+WiWfGWv0CQXyWrzNn0L5Fu9zG865M40pL+9eVMjPNmf0xf4fEKsjGFnQRuXF42dKcYfyor1cEZNUQ81l52JD1Isi2Ya0TcxMUoZnKnqARGc4VYUp3o4qql7q9OtuUCoDYTH9zrk1rpVLwrkBODJdJjZ0EShASs4Y5oEHHee/uiyvQtu1m5fxTaLs9rkFfVlSI8GJRMwjdnl7w94SkdnewWQqOY8IozJ6HfOqTRPV9euHeOHuGIk7caSRtUeAoyB6rH13HHC2ZpeMEw5wAvuhzokT/4MDe8s+qEhLwBbWwqmT9y0a2jm9AcjCbwNeQyyHvYJTPttfv+kcPiwu+gTzcDE7R3yfJrkult9f8PpXex6k3jldCSO2d4CobV4Jtt89a/7xr7TlyZkesdr+2aHafu4tusuPCbYzz997KzmzkOCMIAxfJ0nVd2HOEsTZVP5yR+2rd2jG8RGllVGITVFfW3f1S5F5cFYUqTXt8ggkeEjJpZ3gqxPiIhvC8AB+aKld3Mr6rutLItHSqsX/2EM0/k4670XCyu4KYWxA0bBoRB1mhBjmIl6J5AftZVXY5byp9kjxIMTmkCp3iSOOwszchjGFW4gvhRVPIEvDTUSgEJWAaT3wqLMr5tgxyaXQE3fVyKRoCiBEiLhrTLd2hO2EyeDMa7Wq7iOajljejSSjQMlqS9Oj196en/wE+4ueb";
    const decoded = Buffer.from(usernotesBlob, "base64");
    const rawUsers = JSON.parse(pako.inflate(decoded, {to: "string"})) as RawUsernotesUsers;
    //console.log(rawUsers);

    const usersObject = {};

    for (const [username, {ns}] of Object.entries(rawUsers)) {
        console.log(ns);

        usersObject[username] = {ns: []};
    }

});
