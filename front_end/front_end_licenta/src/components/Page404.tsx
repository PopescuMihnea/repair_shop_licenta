import { FormattedMessage } from "react-intl";
import { NavLink } from "react-router-dom";

const Page404: React.FC = () => {
  return (
    <div className="m-4">
      <p>
        <FormattedMessage
          id="app.page404"
          defaultMessage="This page does not exist"
        />
      </p>
      <NavLink to="/">
        <button className="btn btn-primary mt-2">
          <FormattedMessage
            id="app.backToWelcomePage"
            defaultMessage="Back to welcome page"
          />
        </button>
      </NavLink>
    </div>
  );
};

export default Page404;
