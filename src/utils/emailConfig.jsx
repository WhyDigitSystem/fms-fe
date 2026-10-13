import emailjs from "@emailjs/browser";
import { useEffect, useRef, useState } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toInitCap = (str) => {
  return str
    .split(".")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(".");
};


const SendEmail = async (updatedEmployee, toEmail, data, emailSentFlag) => {
  if (emailSentFlag.current) return; // Prevent email sending if already triggered

  emailSentFlag.current = true; // Set flag to prevent further email sends

  for (let i = 0; i < data.length; i++) {
    try {
      const item = data[i];
      const approveLink = `http://202.21.34.221:8090/authenticate?action=approve&toEmail=${toEmail}&id=${item.id}`;
      const rejectLink = `http://202.21.34.221:8090/authenticate?action=reject&toEmail=${toEmail}&id=${item.id}`;

      const templateParams = {
        empName: updatedEmployee,
        toEmail,
        expenceId: item.expenceId,
        name: item.name,
        amount: item.amount ? new Intl.NumberFormat('en-IN').format(item.amount) : "0", 
        currency: item.currency,
        description: item.description || "N/A",
        docId: item.docId,
        docDate: item.docDate ? new Date(item.docDate).toLocaleDateString("en-GB"):"", 
        outStanding: item.outStanding ? new Intl.NumberFormat('en-IN').format(item.outStanding) : "0", // Indian format
        creditLimit: item.creditLimit ? new Intl.NumberFormat('en-IN').format(item.creditLimit) : "0", // Indian format
        exceedDays: item.exceedDays,
        slabRemarks: item.slabRemarks,
        creditDays: item.creditDays,
        category: item.category,
        controllingOffice: item.controllingOffice,
        salespersonName:item.salespersonName,
        excessCredit: item.excessCredit ? new Intl.NumberFormat('en-IN').format(item.excessCredit) : "0", // Indian format
        osBeyond:item.osBeyond ?  new Intl.NumberFormat('en-IN').format(item.osBeyond) : "0", // Indian format
        approveLink,
        rejectLink,
      };

      console.log("EMail Test",templateParams);

      const response = await emailjs.send(
        "service_q0hz34n",
        "template_nbflxja",
        templateParams,
        "gTWhyzzADVerWfkpS"
      );

      // TEST
      // const response = await emailjs.send(
      //   "service_9y1nnmh",
      //   "template_823h83c",
      //   templateParams,
      //   "A7IEQ6ucoMSeZNw--"
      // );

      console.log(`Email sent successfully for item ${i + 1}:`, response);
      await delay(1000); 
      window.location.reload()// Delay 1 second between emails
    } catch (error) {
      console.error(`Error sending email for item ${i + 1}:`, error);
    }
  }
};

const EmailConfig = ({ updatedEmployee, toEmail, data }) => {
  const [emailSent, setEmailSent] = useState(false);
  const emailSentFlag = useRef(false); // useRef should be inside the component

  useEffect(() => {
    // Check if email has already been sent, to prevent triggering the email again
    if (emailSentFlag.current) return; // Skip if email has already been sent

    // Call SendEmail
    SendEmail(updatedEmployee, toEmail, data, emailSentFlag);
    setEmailSent(true); // Mark email as sent after the first call
    console.log("function called");
  }, [updatedEmployee, toEmail, data]); // Removed emailSent from dependencies

  return null;
};

export default EmailConfig;
