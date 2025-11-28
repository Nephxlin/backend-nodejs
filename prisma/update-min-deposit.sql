-- Script para atualizar o valor mínimo de depósito de 10 para 5
-- Execute este script no banco de dados

UPDATE settings SET min_deposit = 5 WHERE min_deposit = 10;

