export class TASKANSWER {
  static tasks = {
    "38f6dd88-57bd-4b42-8712-286a06dac0a0": "VALUE",
    "d95d3299-e035-4bf6-a7ca-0f71578e9197": "BEST PROJECT EVER",
    "53044aaf-a51f-4dfc-851a-ae2699a5f729": "HEYBLUM",
    "6af85c01-f68d-4311-b78a-9cf33ba5b151": "GO GET",
    // Add more task ids and their corresponding answers here
  };

  static getAnswer(taskId) {
    return this.tasks[taskId] || null;
  }
}
