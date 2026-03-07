import { Router } from 'express';
import {
  createUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/userController';

// Example usage: app.use('/api/users', userRoutes);

const router = Router();

router.post('/', createUserHandler);
router.get('/', getAllUsersHandler);
router.get('/:id', getUserByIdHandler);
router.put('/:id', updateUserHandler);
router.delete('/:id', deleteUserHandler);

export default router;
