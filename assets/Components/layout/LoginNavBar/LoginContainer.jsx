
//require ('../../../styles/general/logocontainer.css');


const LogoContainer = () => {
  return (
    <div>
      <img
        src="/document.png"
        alt="Logo"
        style={{
          height: "100%",       // fills the navbar height
          maxHeight: "60px",    // or whatever your navbar height is
          width: "auto",        // keep aspect ratio
          display: "block",     // remove bottom whitespace
          zIndex: 5000,
          position: "relative",
        }}
      />
</div>
  );
};

export default LogoContainer;