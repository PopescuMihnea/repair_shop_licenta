import { FormattedMessage } from "react-intl";
import { useState, useEffect, useCallback } from "react";
import { Fade } from "react-bootstrap";

const Welcome: React.FC = () => {
  const backendUri = import.meta.env.VITE_REACT_BACKEND_API;
  const [number, setNumber] = useState<number | null>(null);
  const [fadeH5, setFadeH5] = useState(false);
  const [fadeP, setFadeP] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const getCsfr = async (): Promise<void> => {
      try {
        const url = `${backendUri}/repairShop/getNumber`;
        const res = await fetch(url, { credentials: "include" });
        const resBody: { number: number } = await res.json();
        setNumber(resBody.number);
        setCount(resBody.number >= 3 ? resBody.number - 3 : resBody.number);
        setFadeH5(true);
        setTimeout(() => {
          setFadeP(true);
        }, 1000);
      } catch (error) {
        console.error("Error fetching repair shop count:", error);
      }
    };

    getCsfr();
  }, [backendUri]);

  useEffect(() => {
    if (number !== null && fadeP) {
      const timer = setInterval(() => {
        setCount((prevCount) => {
          const newCount = prevCount + 1;
          return newCount >= number ? number : newCount;
        });
      }, 150);

      return () => {
        clearInterval(timer);
      };
    }
  }, [fadeP, count]);

  const renderRepairShopsCount = useCallback(() => {
    if (number === null) {
      return null;
    }

    //console.log("number", number);

    return (
      <Fade in={fadeP}>
        <p>
          <FormattedMessage
            id="app.repairShopHosting"
            defaultMessage={`Currently hosting ${
              count < number ? `${count}...` : count
            } repair
          shops`}
            values={{ count: count < number ? `${count}...` : count }}
          />
        </p>
      </Fade>
    );
  }, [number, fadeP, count]);

  return (
    <div className="text-center mt-5">
      <Fade in={fadeH5}>
        <h5>
          <FormattedMessage
            id="app.welcome"
            defaultMessage="Welcome to the auto repair shop database"
          />
        </h5>
      </Fade>
      {renderRepairShopsCount()}
    </div>
  );
};

export default Welcome;
