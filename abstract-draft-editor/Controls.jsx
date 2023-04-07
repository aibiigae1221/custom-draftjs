import {useState} from "react";
import styles from "./Controls.module.css";
import InlineControl from "./InlineControl";
import ColorPickerControl from "./ColorPickerControl";
import BlockControl from "./BlockControl";
import LinkControl from "./LinkControl";

const Controls = ({handleInlineToggle, showColorPicker, setShowColorPicker, handleBlock, handleColor, promptForLink, confirmLink, showUrlInput, setShowUrlInput, onUrlChange, urlValue, onLinkInputKeyDown, logState}) => {

  const closeUrlInput = (e) => {
    e.preventDefault();
    setShowUrlInput(false);
  };



  return (
    <div className={styles.controls}>

      <InlineControl
          handleInlineToggle={handleInlineToggle} />

      <ColorPickerControl
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        handleColor={handleColor} />

      <BlockControl
        handleBlock={handleBlock} />

      <LinkControl
        promptForLink={promptForLink}
        showUrlInput={showUrlInput}
        onUrlChange={onUrlChange}
        urlValue={urlValue}
        onLinkInputKeyDown={onLinkInputKeyDown}
        confirmLink={confirmLink}
        closeUrlInput={closeUrlInput}
        />
        {/*<button onClick={logState}>로그</button>*/}
    </div>
  );
};

export default Controls;
