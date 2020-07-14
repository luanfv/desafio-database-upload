// import AppError from '../errors/AppError';

import Transaction from './../models/Transaction';
import TransacionsRepository from './../repositories/TransactionsRepository';
import { getCustomRepository, getRepository } from 'typeorm';
import Category from './../models/Category';
import AppError from './../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ category, title, type, value }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransacionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value)
      throw new AppError('You do not have enough balance');

    let transactionCategory = await categoryRepository.findOne({
      where: { 
        title: category, 
      }
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;    
  }
}

export default CreateTransactionService;
