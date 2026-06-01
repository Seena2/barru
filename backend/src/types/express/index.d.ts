import { UserType } from '../models/User'; // Import your actual user type/interface here

declare global {
  namespace Express {
    interface Request {
      user?: UserType; 
    }
  }
}