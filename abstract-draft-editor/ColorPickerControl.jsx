
import styles from "./ColorPickerControl.module.css";

const ColorPickerControl = ({showColorPicker, setShowColorPicker, handleColor}) => {

  const handleClose = (e) => {
    e.preventDefault();
    setShowColorPicker(false);
  };

  const handleColorPickerModal = (e) => {
    e.preventDefault();
    setShowColorPicker(true);
  };

  return (
    <>
      <button onMouseDown={handleColorPickerModal} className={styles.button} type="button">색상</button>

      {showColorPicker &&
        <div className={styles.colorPicker}>
          <strong className={styles.colorPickerHeader}>색상 선택</strong>
          <div>
            <span onMouseDown={(e) => handleColor(e, "black")} className={`${styles.colorBox} ${styles.colorBlack}`}></span>
            <span onMouseDown={(e) => handleColor(e, "red")} className={`${styles.colorBox} ${styles.colorRed}`}></span>
            <span onMouseDown={(e) => handleColor(e, "blue")} className={`${styles.colorBox} ${styles.colorBlue}`}></span>
            <span onMouseDown={(e) => handleColor(e, "green")} className={`${styles.colorBox} ${styles.colorGreen}`}></span>
            <span onMouseDown={(e) => handleColor(e, "yellow")} className={`${styles.colorBox} ${styles.colorYellow}`}></span>
            <span onMouseDown={(e) => handleColor(e, "orange")} className={`${styles.colorBox} ${styles.colorOrange}`}></span>
            <span onMouseDown={(e) => handleColor(e, "gray")} className={`${styles.colorBox} ${styles.colorGray}`}></span>
            <span onMouseDown={(e) => handleColor(e, "purple")} className={`${styles.colorBox} ${styles.colorPurple}`}></span>
          </div>
          <div className={styles.buttonHolder}>
            <button onMouseDown={handleClose} className={styles.closeButton} type="button">닫기</button>
          </div>
        </div>
      }

    </>
  );
};

export default ColorPickerControl;
