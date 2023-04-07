import {useState} from "react";
import styles from "./EditorInputLink.module.css";

const EditorInputLink = props => {
  const {url} = props.contentState.getEntity(props.entityKey).getData();
  const [show, setShow] = useState(false);


  const handleOpen = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <>
      <a href={url} alt={url} className={styles.link} onClick={handleOpen}>
        {props.children}
      </a>
      {show === true && (
        <div className={styles.hrefModal} contentEditable="false">
          <a href={url} alt={url} target="_blank" rel="noreferrer" className={styles.anchor}>{url}</a>
          <button onClick={handleClose} className={styles.closeButton}>닫기</button>
        </div>
      )}
    </>
  );
};

// contentEditable 경고 지우는 코드 복붙..
console.error = (function() {
    let error = console.error

    return function(exception) {
        if ((exception + '').indexOf('Warning: A component is `contentEditable`') !== 0) {
            error.apply(console, arguments)
        }
    }
})()

export default EditorInputLink;
