

export default function Footer({ open }) {
  

  return (
    <div className={open ? "footer-open" : "footer"}>
      <p>&copy; Developed by Andres Guaglianone.</p>
    </div>
  );
}