export const formatInitials = (name: string): string => {
  let result = '';
  for (const el of name?.split(' ')) {
    if (el && el?.[0]) {
      result += el[0];
    }
  }
  return result;
};
