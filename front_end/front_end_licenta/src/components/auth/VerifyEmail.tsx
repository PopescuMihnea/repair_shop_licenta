import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguageContextMessages } from "../../context/language";

const VerifyEmail: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const { id } = useParams();
  const [verifyMessage, setVerifyMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const languageContext: any = useLanguageContextMessages().language;

  useEffect(() => {
    const verifyEmail = async (): Promise<void> => {
      try {
        let url = `${backendUri}/csrf`;
        const res = await fetch(url, { credentials: "include" });
        const csrf: { csrfToken: string } = await res.json();

        url = `${backendUri}/auth/verify/${id}`;
        await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _csrf: csrf.csrfToken }),
        }).then((response) => {
          if (response.ok) {
            setSuccess(true);
            setVerifyMessage("Email was verified");
          } else if (response.status === 401) {
            setSuccess(false);
            setVerifyMessage("Code has expired");
          } else if (response.status === 404) {
            setSuccess(false);
            setVerifyMessage("Code not found");
          } else {
            setSuccess(false);
            setVerifyMessage("Error verifying email");
          }
        });
      } catch (error) {
        console.error("Error verifying email: ", error);
        setSuccess(false);
        setVerifyMessage("Error verifying email");
      }
    };

    verifyEmail();
  }, [backendUri]);
  return (
    <p className={success ? "text-success m-5" : "text-danger m-5"}>
      {success
        ? languageContext[verifyMessage]
        : languageContext.errors[verifyMessage]}
    </p>
  );
};

export default VerifyEmail;
