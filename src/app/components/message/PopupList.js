import PopUp from "./popUp";

const PopupList = ({ popups }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        right: "1em",
        top: "1em",
        zIndex: "5000",
      }}
    >
      {popups.map((popup, index) => (
        <PopUp
          key={index}
          content={popup.content}
          title={popup.title ? popup.title : ""}
          type={popup.type ? popup.type : ""}
        />
      ))}
    </div>
  );
};

export default PopupList;
