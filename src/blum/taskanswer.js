export class TASKANSWER {
  static tasks = {
    "38f6dd88-57bd-4b42-8712-286a06dac0a0": "VALUE",
    // Add more task ids and their corresponding answers here
  };

  static getAnswer(taskId) {
    return this.tasks[taskId] || null;
  }
}
