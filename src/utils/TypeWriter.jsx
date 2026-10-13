import { useEffect, useState } from "react";
import "./TypeWriter.css";

const Typewriter = ({
  uniqueCusData,
  selectedParty,
  rankinvdata,
  brcusdata,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Reset typing when selectedParty changes
  useEffect(() => {
    setDisplayText("");
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsTyping(false);
  }, [selectedParty]);

  useEffect(() => {
    console.log("🤖 Typewriter received data:", {
      selectedParty: selectedParty?.subledgerName || selectedParty,
      uniqueCusDataLength: uniqueCusData?.length,
      uniqueCusData: uniqueCusData,
      rankinvdataLength: rankinvdata?.length,
      rankinvdata: rankinvdata,
      brcusdataLength: brcusdata?.length,
      brcusdata: brcusdata,
    });
  }, [uniqueCusData, selectedParty, rankinvdata, brcusdata]);

  useEffect(() => {
    if (!selectedParty) {
      setDisplayText("Select a customer to get AI insights");
      return;
    }

    // Prepare lines with current data
    const lines = [
      "Analyzing Customer Profile",
      "────────────────────",
      `• Customer Name: ${selectedParty.subledgerName || selectedParty}`,
      `• On Board: ${uniqueCusData[0]?.onYear || "N/A"}`,
      `• Credit Days: ${uniqueCusData[0]?.creditDays || "N/A"}`,
      `• Credit Limit: ₹${
        uniqueCusData[0]?.creditLimit
          ? (uniqueCusData[0].creditLimit / 100000).toFixed(2) + " L"
          : "N/A"
      }`,
      `• Sales Person: ${uniqueCusData[0]?.salesPersonName || "N/A"}`,
      "",
      "Generating insights...",
      "─────────────────",
      // "",
      //   "Detailed Analysis:",
      //   "────────────────────",
      `• Last Month Rank: ${rankinvdata[0]?.r || "N/A"}`,
      `• Total Due: ₹${
        uniqueCusData[0]?.totDue
          ? (uniqueCusData[0].totDue / 100000).toFixed(0) + " L"
          : "N/A"
      }`,
      `• Branch Performance: ${brcusdata.length} branches`,
    ];

    setIsTyping(true);
    let timeout;

    const typeNextCharacter = () => {
      if (currentLineIndex < lines.length) {
        const currentLine = lines[currentLineIndex];

        if (currentCharIndex < currentLine.length) {
          setDisplayText((prev) => prev + currentLine.charAt(currentCharIndex));
          setCurrentCharIndex((prev) => prev + 1);
        } else {
          setDisplayText((prev) => prev + "\n");
          setCurrentLineIndex((prev) => prev + 1);
          setCurrentCharIndex(0);
        }
      } else {
        setIsTyping(false);
      }
    };

    timeout = setTimeout(typeNextCharacter, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    selectedParty,
    uniqueCusData,
    rankinvdata,
    brcusdata,
    currentLineIndex,
    currentCharIndex,
  ]);

  return (
    <div
      style={{
        color: "white",
        fontFamily: "'Waiting for the Sunrise', cursive",
        fontSize: "14px",
        letterSpacing: "6px",
        whiteSpace: "pre-wrap",
        minHeight: "200px",
      }}
    >
      {displayText}
      {isTyping && (
        <span style={{ animation: "blink 1s step-end infinite" }}>|</span>
      )}
    </div>
  );
};

export default Typewriter;
