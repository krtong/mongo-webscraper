let messageCreator = {}
messageCreator.message = 'hello '
this.prototype.message = 'hi'
messageCreator.fullMessage = this.message + 'world';

console.log(messageCreator.fullMessage)