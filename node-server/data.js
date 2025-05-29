// globalState.js
let globalState = {
  userSocketMap: new Map(),
  // messages: [],
  messages: [
    { from: 'alice', message: 'Hello!', time: 1712936400000 },
    { from: 'bob', message: 'How are you?', time: 1712937000000 },
    { from: 'charlie', message: 'Nice to meet you.', time: 1712937600000 },
    { from: 'david', message: 'Where are you from?', time: 1712938200000 },
    { from: 'emma', message: 'Good morning!', time: 1712938800000 },
    { from: 'frank', message: 'Good night!', time: 1712939400000 },
    { from: 'grace', message: 'See you later.', time: 1712940000000 },
    { from: 'henry', message: 'Bye bye!', time: 1712940600000 },
    { from: 'isabella', message: 'Yes!', time: 1712941200000 },
    { from: 'jack', message: 'No!', time: 1712941800000 },
    { from: 'kate', message: 'Okay.', time: 1712942400000 },
    { from: 'leo', message: 'Wait a minute.', time: 1712943000000 },
    { from: 'mia', message: 'Really?', time: 1712943600000 },
    { from: 'nick', message: 'Interesting.', time: 1712944200000 },
    { from: 'olivia', message: 'Let’s go!', time: 1712944800000 },
    { from: 'paul', message: 'Hurry up!', time: 1712945400000 },
    { from: 'quinn', message: 'Cool!', time: 1712946000000 },
    { from: 'rachel', message: 'Thanks.', time: 1712946600000 },
    { from: 'sam', message: 'Welcome.', time: 1712947200000 },
    { from: 'tom', message: 'What’s up?', time: 1712947800000 },
  ],
  tasks: {},
  usersEmails: new Map(),
};

module.exports = globalState;
