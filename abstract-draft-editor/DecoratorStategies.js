
// 에디터 작성글에 링크 엔티티가 포함되어 있는지 검사
export const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null && contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
};
