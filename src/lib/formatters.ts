export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'Never counted';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const calculateVariancePercent = (system: number, counted: number) => {
  if (system === 0) return 0;
  return ((counted - system) / system) * 100;
};
