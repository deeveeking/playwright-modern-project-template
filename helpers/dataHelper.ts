export const removeDollarSign = (value: string): string => {
    return value.replaceAll("$", "").trim();
};
