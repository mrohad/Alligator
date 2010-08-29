this.page = function (context){context.writeEscapedText("night%3A%20");context.write(context.request.parameters.night?context.request.parameters.night:"nothing");context.writeEscapedText("%3Cbr/%3E%0A");
context.writeEscapedText("day%3A%20");context.write(context.request.parameters.day?context.request.parameters.day:"nothing");context.writeEscapedText("%3Cbr/%3E%0A");
};