import { createContext, useCallback, useContext, useState } from 'react';
import referralService from '../api/referralService';
import { getApiErrorMessage } from '../api/apiUtils';
import { dedupeReferralsById } from '../utils/referralUtils';

const ReferralContext = createContext(null);

export const useReferrals = () => {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferrals must be used within ReferralProvider');
  }
  return context;
};

/**
 * Lightweight referral cache backed by the API (no localStorage source of truth).
 */
export const ReferralProvider = ({ children }) => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshReferrals = useCallback(async (status = null) => {
    setLoading(true);
    try {
      const data = await referralService.getMyReferrals(status);
      setReferrals(dedupeReferralsById(data));
      return data;
    } catch (error) {
      console.error(getApiErrorMessage(error));
      setReferrals([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    referrals,
    loading,
    refreshReferrals,
  };

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
};
