// Export all models
export { default as User } from './user.model';
export { default as Course } from './course.model';
export { default as Enrollment } from './enrollment.model';
export { default as ChatMessage } from './chat-message.model';

// Import models for associations
import User from './user.model';
import Course from './course.model';
import Enrollment from './enrollment.model';
import ChatMessage from './chat-message.model';

// Define associations
const models: { [key: string]: any } = {
  User,
  Course,
  Enrollment,
  ChatMessage
};

// Call associate methods
Object.keys(models).forEach((modelName: string) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});
