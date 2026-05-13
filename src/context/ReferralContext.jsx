import { createContext, useContext, useState, useEffect } from 'react';

const ReferralContext = createContext(null);

export const useReferrals = () => useContext(ReferralContext);

export const ReferralProvider = ({ children }) => {
  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem('referrals');
    return saved ? JSON.parse(saved) : [];
  });

  const addReferral = (referral) => {
    const newReferral = {
      ...referral,
      id: Date.now(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [...referrals, newReferral];
    setReferrals(updated);
    localStorage.setItem('referrals', JSON.stringify(updated));
    window.dispatchEvent(new Event('referrals-updated'));
  };

  const updateReferralStatus = (id, status) => {
    let current = referrals;
    try {
      const raw = localStorage.getItem('referrals');
      if (raw) current = JSON.parse(raw);
      if (!Array.isArray(current)) current = [];
    } catch {
      current = referrals;
    }
    const updated = current.map((r) => (r.id === id ? { ...r, status } : r));
    setReferrals(updated);
    localStorage.setItem('referrals', JSON.stringify(updated));
    window.dispatchEvent(new Event('referrals-updated'));
  };

  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const saved = localStorage.getItem('referrals');
        setReferrals(saved ? JSON.parse(saved) : []);
      } catch {
        setReferrals([]);
      }
    };
    window.addEventListener('referrals-updated', syncFromStorage);
    return () => window.removeEventListener('referrals-updated', syncFromStorage);
  }, []);

  return (
    <ReferralContext.Provider value={{ referrals, addReferral, updateReferralStatus }}>
      {children}
    </ReferralContext.Provider>
  );
};
