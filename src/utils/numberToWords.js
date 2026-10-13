// Utility function to format currency with commas
const formatCurrency = (value) => {
  return (
    value?.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || "0.00"
  );
};

// Utility function to convert number to words
const numberToWords = (num) => {
  if (isNaN(num)) return "";
  const single = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const double = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const formatTenth = (digit, prev) => {
    return digit === 0 ? "" : " " + (digit === 1 ? double[prev] : tens[digit]);
  };

  const formatOther = (digit, next, denom) => {
    return (
      (digit !== 0 && next !== 1 ? " " + single[digit] : "") +
      (next !== 0 || digit > 0 ? " " + denom : "")
    );
  };

  let str = "";
  let rupees = Math.floor(num);
  let paise = Math.round((num - rupees) * 100);

  if (rupees > 0) {
    str +=
      (single[rupees] ||
        (rupees < 20
          ? double[rupees - 10]
          : tens[Math.floor(rupees / 10)] +
            (rupees % 10 > 0 ? " " + single[rupees % 10] : ""))) + " Rupees";
  }

  if (paise > 0) {
    if (rupees > 0) str += " and ";
    str +=
      (single[paise] ||
        (paise < 20
          ? double[paise - 10]
          : tens[Math.floor(paise / 10)] +
            (paise % 10 > 0 ? " " + single[paise % 10] : ""))) + " Paise";
  }

  return str + " Only";
};
