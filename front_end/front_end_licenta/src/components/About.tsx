const About: React.FC = () => {
  return (
    <div>
      <p className="ms-4 mt-4" style={{ fontSize: "2em" }}>
        Mihnea-Valentin Popescu
      </p>
      <p className="ms-4 mt-2">Contact: mihnea.popescu.valentin@gmail.com</p>
      <p className="ms-4 mt-2">FMI Unibuc 2023</p>
      <img
        alt="FMI logo"
        src="/FMI_logo.png"
        className="img-fluid mt-3"
        style={{ maxWidth: "300px" }}
      />
    </div>
  );
};

export default About;
