import { createAction } from '@reduxjs/toolkit';
import { SecurityCheckResponse } from '../../types/securityCheckTypes';

export const startSecurityCheck = createAction('securityCheck/start');
export const updateStep = createAction<{ step: string, status: 'success' | 'failure' }>('securityCheck/updateStep');
export const setFinalScore = createAction<SecurityCheckResponse>('securityCheck/setFinalScore');
export const resetSecurityCheck = createAction('securityCheck/reset');
