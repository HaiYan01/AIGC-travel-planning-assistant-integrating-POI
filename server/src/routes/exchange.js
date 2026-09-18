import { Router } from 'express';
import { getExchangeRate, getAllRates, convertCurrency, currencies } from '../services/exchangeService.js';

const router = Router();

// 获取所有支持的货币
router.get('/currencies', (req, res) => {
  res.json(currencies);
});

// 获取指定货币的汇率
router.get('/rate/:from/:to', async (req, res, next) => {
  try {
    const { from, to } = req.params;
    const result = await getExchangeRate(from.toUpperCase(), to.toUpperCase());
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 获取所有主要货币汇率
router.get('/rates/:base', async (req, res, next) => {
  try {
    const result = await getAllRates(req.params.base.toUpperCase());
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 货币转换
router.post('/convert', async (req, res, next) => {
  try {
    const { amount, from, to } = req.body;
    if (!amount || !from || !to) {
      return res.status(400).json({ error: '请提供金额和货币类型' });
    }
    const result = await convertCurrency(parseFloat(amount), from.toUpperCase(), to.toUpperCase());
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
