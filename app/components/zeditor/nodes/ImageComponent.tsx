import { HashtagNode } from '@lexical/hashtag';
import { LinkNode } from '@lexical/link';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { useCollaborationContext } from '@lexical/react/LexicalCollaborationContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { $getNodeByKey, $getSelection, $isNodeSelection, $isRangeSelection, $setSelection, BaseSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, DRAGSTART_COMMAND, KEY_DELETE_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, LexicalCommand, LexicalEditor, LineBreakNode, NodeKey, ParagraphNode, RootNode, SELECTION_CHANGE_COMMAND, TextNode, createCommand } from 'lexical';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSharedHistoryContext } from '../context/SharedHistoryContext';
import brokenImage from '../images/image-broken.svg';
import { EmojiNode } from '../plugin/emoji/EmojiNode';
import { $isImageNode } from './ImageNode';
import { KeywordNode } from './KeywordNode';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { validateUrl } from '../plugin/LinkPlugin';
import { EmojiPlugin } from '../plugin/emoji/EmojiPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { KeywordsPlugin } from '../plugin/KeywordsPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ImageResizer } from '../ui/ImageResizer';

const imageCache = new Set();

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> = createCommand('RIGHT_CLICK_IMAGE_COMMAND');

const useSuspenseImage = (src: string) => {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
      img.onerror = () => {
        imageCache.add(src);
      };
    });
  }
};

const LazyImage = ({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  maxWidth,
  onError
}: {
  altText: string;
  className: string | null;
  height: 'inherit' | number;
  imageRef: { current: null | HTMLImageElement; };
  maxWidth: number;
  src: string;
  width: 'inherit' | number; onError: () => void;
}) => {
  useSuspenseImage(src);
  return <img
    className={className || undefined}
    src={src}
    alt={altText}
    ref={imageRef}
    style={{
      height,
      maxWidth,
      width
    }}
    onError={onError}
    draggable={false}
  />;
};

const BrokenImage = () => <img src={brokenImage} un-h='50' un-w='50' un-opacity='20' />;

export const ImageComponent = ({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
  showCaption,
  caption,
  captionsEnabled,
}: {
  altText: string;
  caption: LexicalEditor;
  height: 'inherit' | number;
  maxWidth: number;
  nodeKey: NodeKey;
  resizable: boolean;
  showCaption: boolean;
  src: string;
  width: 'inherit' | number;
  captionsEnabled: boolean;
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);
  const { isCollabActive } = useCollaborationContext();
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const [isLoadError, setIsLoadError] = useState(false);

  const $onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        // const event: KeyboardEvent = payload;
        // event.preventDefault();
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey]
  );

  const $onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElm = buttonRef.current;
      if (
        isSelected
        && $isNodeSelection(latestSelection)
        && latestSelection.getNodes().length === 1
      ) {
        if (showCaption) {
          $setSelection(null);
          event.preventDefault();
          caption.focus();
          return true;
        } else if (
          buttonElm !== null
          && buttonElm !== document.activeElement
        ) {
          event.preventDefault();
          buttonElm.focus();
          return true;
        }
      }
      return false;
    },
    [caption, isSelected, showCaption]
  );

  const $onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (activeEditorRef.current === caption
        || buttonRef.current === event?.target
      ) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [caption, editor, setSelected]
  );

  const onClick = useCallback(
    (event: MouseEvent) => {
      if (isResizing) {
        return true;
      }

      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }

      return false;
    },
    [isResizing, isSelected, setSelected, clearSelection]
  );

  const onRightClick = useCallback(
    (event: MouseEvent) => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection();
        const domElement = event.target as HTMLElement;
        if (
          domElement.tagName === 'IMG'
          && $isRangeSelection(latestSelection)
          && latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(
            RIGHT_CLICK_IMAGE_COMMAND,
            event as MouseEvent
          );
        }
      });
    },
    [editor]
  );

  useEffect(() => {
    let isMounted = true;
    const rootElement = editor.getRootElement();
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        RIGHT_CLICK_IMAGE_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        $onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW)
    );

    rootElement?.addEventListener('contextmenu', onRightClick);

    return () => {
      isMounted = false;
      unregister();
      rootElement?.removeEventListener('contextmenu', onRightClick);
    };
  }, [
    clearSelection,
    editor,
    isResizing,
    nodeKey,
    $onDelete,
    $onEnter,
    $onEscape,
    onClick,
    onRightClick,
    setSelected
  ]);

  const setShowCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setShowCaption(true);
      }
    });
  };

  const onResizeEnd = (nextWidth: 'inherit' | number, nextHeight: 'inherit' | number) => {
    setTimeout(() => { setIsResizing(false); }, 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => setIsResizing(true);

  const { historyState } = useSharedHistoryContext();
  const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
  const isFocused = isSelected || isResizing;

  return <Suspense>
    <>
      <div draggable={draggable} >
        {isLoadError ? <BrokenImage /> : <LazyImage
          className={isFocused ? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}` : null}
          src={src}
          altText={altText}
          imageRef={imageRef}
          width={width}
          height={height}
          maxWidth={maxWidth}
          onError={() => setIsLoadError(true)}
        />}
      </div>

      {showCaption && <div className="image-caption-container">
        <LexicalNestedComposer
          initialEditor={caption}
          initialNodes={[
            RootNode,
            TextNode,
            LineBreakNode,
            ParagraphNode,
            LinkNode,
            EmojiNode,
            HashtagNode,
            KeywordNode
          ]}
        >
          <AutoFocusPlugin />
          {/* mentions plugin */}
          <LinkPlugin validateUrl={validateUrl} />
          <EmojiPlugin />
          <HashtagPlugin />
          <KeywordsPlugin />
        </LexicalNestedComposer>
        <HistoryPlugin externalHistoryState={historyState} />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="ImageNode__contentEditable" />
          }
          placeholder={
            <div className="ImageNode__placeholder">
              Enter a caption...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* TreeViewPlugin */}
      </div>}

      {resizable && $isNodeSelection(selection) && isFocused && (
        <ImageResizer
          showCaption={showCaption}
          setShowCaption={setShowCaption}
          editor={editor}
          buttonRef={buttonRef}
          imageRef={imageRef}
          maxWidth={maxWidth}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
          captionsEnabled={!isLoadError && captionsEnabled}
        />
      )}
    </>
  </Suspense>;
};
