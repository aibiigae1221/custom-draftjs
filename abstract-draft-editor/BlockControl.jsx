
import styles from "./BlockControl.module.css";

const BlockControl = ({handleBlock}) => {
  return (
    <select onChange={handleBlock} defaultValue="paragraph" className={styles.select}>
      <option value="header-one">헤딩</option>
      <option value="paragraph">문단</option>
    </select>
  );
};

export default BlockControl;
