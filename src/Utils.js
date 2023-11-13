"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestion = void 0;
// Generate a random multiplication question
function generateQuestion() {
    var num1 = Math.floor(Math.random() * 8) + 2;
    var num2 = Math.floor(Math.random() * 8) + 2;
    return "".concat(num1, " * ").concat(num2);
}
exports.generateQuestion = generateQuestion;
//# sourceMappingURL=Utils.js.map