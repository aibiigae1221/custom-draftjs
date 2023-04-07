import { useState, useEffect, useRef, useCallback } from 'react';
import {Editor, EditorState,
        RichUtils, convertToRaw, CompositeDecorator, Modifier,
        getDefaultKeyBinding} from 'draft-js';
import Controls from "./Controls";
import EditorInputLink from "./EditorInputLink";
import {stateToHTML} from 'draft-js-export-html';

import colorStyleMap from "./ColorStyleMap";
import {findLinkEntities} from "./DecoratorStategies";

import 'draft-js/dist/Draft.css';
import "./AbstractDraftEditor.css";




const AbstractDraftEditor = ({dataChangeCallback}) => {

  // 링크 데코레이터
  const decorator = new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: EditorInputLink
    }
  ]);

  // 에디터 초기화
  const [editorState, setEditorState] = useState(EditorState.createEmpty(decorator));

  // 링크 컨트롤 모달 보여주기
  const [showUrlInput, setShowUrlInput] = useState(false);

  // 링크 기능에 쓰일 url 저장공간
  const [urlValue, setUrlValue] = useState("");

  // 컬러 피커 컨트롤 표시 여부
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editorRef = useRef(null);


  const getContentAsHTML = useCallback(() => {
    let options = {
      inlineStyles: {

        BOLD: {element:"span", style: {fontWeight: "bold"}},
        ITALIC: {element:"span", style: {fontStyle: "italic"}},
        UNDERLINE: {element:"span", style: {textDecoration: "underline"}},
        STRIKETHROUGH: {element:"span", style: {textDecoration: "line-through"}},

        black: {style: {color: "rgba(0, 0, 0, 1.0)"}},
        red: {style: {color: "rgba(255, 0, 0, 1.0)"}},
        blue: {style: {color: "rgba(0,0,255, 1.0)"}},
        green: {style: {color: "rgba(0,128,0, 1.0)"}},
        yellow: {style: {color: "rgba(255,255,0, 1.0)"}},
        orange: {style: {color: "rgba(255,165,0, 1.0)"}},
        gray: {style: {color: "rgba(128,128,128, 1.0)"}},
        purple: {style: {color: "rgba(128,0,128, 1.0)"}},

      },
    };

    const contentState = editorState.getCurrentContent();
    return stateToHTML(contentState, options);
  }, [editorState]);

  // 에디터 controlling dom
  const onChange = (newState) => {
    setEditorState(newState);
  };

  useEffect(() => {
    const html = getContentAsHTML();
    dataChangeCallback(html);

  }, [editorState, dataChangeCallback, getContentAsHTML]);

  // 인라인 엔티티에 스타일 적용
  const handleInlineToggle = (e, inlineStyle) => {
    e.preventDefault();
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  // 로그
  const logState = () => {
    const content = editorState.getCurrentContent();
    console.log(convertToRaw(content));
  };

  // 링크 컨트롤 모달 오픈 시, 현재 선택된 문자열에 링크 정보가 담겨있으면 링크 입력칸에 링크 정보를 보여줌.
  const promptForLink = e => {
    e.preventDefault();
    const selection = editorState.getSelection();
    if(!selection.isCollapsed()){
      const contentState = editorState.getCurrentContent();
      const startKey = editorState.getSelection().getStartKey();
      const startOffset = editorState.getSelection().getStartOffset();
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
      const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);

      let url = "";
      if(linkKey){
        const linkInstance = contentState.getEntity(linkKey);
        url = linkInstance.getData().url;

      }

      setUrlValue(url);
      setShowUrlInput(true);
    }
  };

  // 현재 선택된 문자열에 링크 엔티티를 부여함
  const confirmLink = e => {
    e.preventDefault();
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity("LINK", "MUTABLE", {url: urlValue});
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {currentContent: contentStateWithEntity});
    setEditorState(RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey));
  };

  // 링크 입력 모달창에서 엔터를 누를 경우, 선택된 텍스트에 링크를 부여하는 기능을 담은 메서드로 연결
  const onLinkInputKeyDown = e => {
    if(e.which === 13){
      confirmLink(e);
    }
  };

  // 예제 코드에서 가져온 건데 아직 사용 안해봄
  /*
  const removeLink = e => {
    e.preventDefault();

    const selectionState = editorState.getSelection();
    if(!selectionState.isCollapsed()){
      setEditorState(RichUtils.toggleLink(editorState, selectionState, null));
    }
  };
  */

  // 탭키 바인딩
  const myKeyBindingFn = e => {

    if (e.keyCode === 9) {
      e.preventDefault();
      return 'tab';
    }
    return getDefaultKeyBinding(e);
  }


  // 단축키(인라인 속성들과 탭키)를 이용한 에디터 작성글 수정.
  const handleKeyCommand = (command, editorState) => {

    if(command === "BOLD" || command === "ITALIC" || command === "UNDERLINE" || command === "STRIKETHROUGH"){
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if(newState){
        onChange(newState);
        return "handled";
      }
    }else{

      if(command === "tab"){
        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const newContentState = Modifier.insertText(contentState, selection, "\t");
        const newEditorState = EditorState.push(editorState, newContentState, "insert-characters");
        setEditorState(newEditorState);
        return "handled";
      }
    }

    return "not-handled";
  };

  // 링크 입력 모달에서 링크 입력 텍스트 필드 데이터 추적
  const onUrlChange = (e) => {
    setUrlValue(e.target.value);
  };

  // 가장 난해했던 메서드... 복붙한게 많았음.
  // color map에 존재하는 특정 color를, 에디터의 최근 위치로부터 글자색으로 지정
  const handleColor = (e, inputColor) => {
    e.preventDefault();

    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    // Object.keys()로 {green, yellow, orange, ...} 배열을 받아오고 [].reduce를 진행.
    // 초기값으로 contentState를 주고 이를 기반으로 하여 color 들을 loop돌려서 color들을 제거한다.
    // 루프를 돌릴 떄 마다, 즉 인라인 스타일을 제거할 때마다 Modifier.removeInlineStyle() 메서드에서
    // 반환되는 새로운 상태 시점인 contentState가 다음 루프의 입력값으로 쓰인다.
    // (콜백에서 contentState를 리턴하는 것을 볼 수 있음)
    // 그렇게 루프가 모두 끝나면 마지막 루프에서 반환된 contentState가 "newContentState"에 담긴다.
    const nextContentState = Object.keys(colorStyleMap).reduce((contentState, color) => {
      return Modifier.removeInlineStyle(contentState, selection, color)
    }, contentState);

    // Redo/Undo 히스토리에 저장
    let nextEditorState = EditorState.push(editorState, nextContentState, "change-inline-style");

    // 텍스트를 작성하면서 컬러를 변경해오면 currentStyle변수에 컬러를 변경한 이력(갯수)이 들어가는 듯
    const currentStyle = editorState.getCurrentInlineStyle();

    // 텍스트 범위지정이 없으면
    if(selection.isCollapsed()){

      nextEditorState = currentStyle.reduce((state, colorStyle) => {
      // let a= 1;
      //console.log("시도 횟수: " + a++);
        // 칼라를 주황,초록 번갈아가면서 세팅하고 글을 입력하면 reduce 루프가 2번 도는 것을 확인함
        // 처음에 주황, 그 후에 초록 값이 루프로 돌았다면
        // 처음에는 주황이 설정되어 있는 상태에서 토글기능으로 주황을 지우고
        // 두 번째 세팅된 초록 값도 토글 기능으로 지운다.
        // 즉, 현재 적용된 칼라 들을 제거한다.
        return RichUtils.toggleInlineStyle(state, colorStyle);
      }, nextEditorState);
    }

    // 현재 스타일에 이 메서드를 통해 전해진 color 스타일이 적용되지 않았다면
    if(!currentStyle.has(inputColor)){
      // 해당 color 스타일을 부여/해제(토글) 해준다.
      nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, inputColor);

      // 그리고 정보 저장과 UI 업데이트
      setEditorState(nextEditorState);
      setShowColorPicker(false);
    }
  };

  // 블락 타입 텍스트를 부여/해제(토글)한다.
  const handleBlock = e => {
    const newEditorState = RichUtils.toggleBlockType(editorState, e.target.value);
    onChange(newEditorState);
  };

  const focusEdtior = () => {

    editorRef.current.focus()
  };

  return (
    <div className="editor-wrap">
      <Controls
        handleInlineToggle={handleInlineToggle}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        handleBlock={handleBlock}
        handleColor={handleColor}
        promptForLink={promptForLink}
        confirmLink={confirmLink}
        showUrlInput={showUrlInput}
        setShowUrlInput={setShowUrlInput}
        onUrlChange={onUrlChange}
        urlValue={urlValue}
        onLinkInputKeyDown={onLinkInputKeyDown}
        logState={logState}

      />


      <div onClick={focusEdtior}>
        <Editor
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          placeholder="텍스트 입력.."
          keyBindingFn={myKeyBindingFn}
          customStyleMap={colorStyleMap}
          ref={editorRef}
        />
      </div>
    </div>
  );
};






export default AbstractDraftEditor;
