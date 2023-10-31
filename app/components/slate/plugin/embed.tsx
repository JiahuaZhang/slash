import { FacebookEmbed, InstagramEmbed, LinkedInEmbed, PinterestEmbed, TikTokEmbed, TwitterEmbed } from 'react-social-media-embed';
import { Editor, Transforms } from 'slate';
import { RenderElementProps } from 'slate-react';

export const EMBED_TYPES = ['youtube', 'facebook', 'instagram', 'linkedIn', 'pinterest', 'tiktok', 'twitter'];

const YouTube = ({ children, element, ...rest }: RenderElementProps) => {
  const { id } = element as any;
  return <div
    un-position='relative'
    un-w='full'
    un-max-w='[1280px]'
    un-p='b-[39.54%]'
    un-mx='auto'
    contentEditable={false}
    {...rest}
  >
    <iframe
      src={`https://www.youtube.com/embed/${id!}`}
      aria-label="Youtube video"
      un-position='absolute'
      un-top='0'
      un-left='0'
      un-w='full'
      un-h='full'
    />
    {children}
  </div>;
};

const Facebook = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center'{...rest} >
    <FacebookEmbed url={url!} />
    {children}
  </div>;
};

const Instagram = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <InstagramEmbed url={url!} width={500} />
    {children}
  </div>;
};

const LinkedIn = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <LinkedInEmbed url={url!} width={500} />
    {children}
  </div>;
};

const Pinterest = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <PinterestEmbed url={url!} height={540} />
    {children}
  </div>;
};

const TikTok = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <TikTokEmbed url={url!} />
    {children}
  </div>;
};

const Twitter = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div un-flex='~ justify-center' {...rest}>
    <TwitterEmbed url={url!} width={400} />
    {children}
  </div>;
};

export const renderEmbed = (props: RenderElementProps) => {
  switch (props.element.type) {
    case 'youtube':
      return <YouTube {...props} />;
    case 'facebook':
      return <Facebook {...props} />;
    case 'instagram':
      return <Instagram {...props} />;
    case 'linkedin':
      return <LinkedIn {...props} />;
    case 'pinterest':
      return <Pinterest {...props} />;
    case 'tiktok':
      return <TikTok {...props} />;
    case 'twitter':
      return <Twitter {...props} />;
  }
  return null;
};

const handleYouTube = (text: string, editor: Editor) => {
  const youtubeRegex = /^(?:(?:https?:)?\/\/)?(?:(?:www|m)\.)?(?:(?:youtube\.com|youtu.be))(?:\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(?:\S+)?$/;

  const matches = text.match(youtubeRegex);
  if (!matches) { return false; }

  const [_, id] = matches;
  Transforms.insertNodes(
    editor, [{ type: 'youtube', id, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleFacebook = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?facebook\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'facebook', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleInstagram = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?instagram\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'instagram', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleLinkedIn = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?linkedin\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'linkedin', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handlePinterest = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?pinterest\.(com|co\.uk).*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'pinterest', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleTikTok = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?tiktok\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'tiktok', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

const handleTwitter = (text: string, editor: Editor) => {
  const regex = /^https?:\/\/(www\.)?twitter\.com.*/;

  const matches = text.match(regex);
  if (!matches) { return false; }

  Transforms.insertNodes(
    editor, [{ type: 'twitter', url: text, children: [{ text: '' }] } as any]
  );
  return true;
};

export const handleEmbed = (text: string, editor: Editor) => {
  return [handleYouTube, handleFacebook, handleInstagram, handleLinkedIn, handlePinterest, handleTikTok, handleTwitter]
    .some(fn => fn(text, editor));
};

export const dummyData = [
  {
    type: 'twitter',
    url: 'https://twitter.com/bboczeng/status/1704506963864740350',
    children: [{ text: '' }]
  },
  {
    type: 'tiktok',
    url: 'https://www.tiktok.com/@gemdzq/video/7273529185589562625?lang=en',
    children: [{ text: '' }]
  },
  {
    type: 'tiktok',
    url: 'https://www.tiktok.com/@naho_nishikawaka/video/7252313395729353992?lang=en',
    children: [{ text: '' }]
  },
  {
    type: 'pinterest',
    url: 'https://www.pinterest.co.uk/pin/345721708908845555/',
    children: [{ text: '' }]
  },
  {
    type: 'linkedin',
    url: 'https://www.linkedin.com/embed/feed/update/urn:li:share:6898694772484112384',
    children: [{ text: '' }]
  },
  {
    type: 'linkedin',
    url: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7109495184224124928',
    children: [{ text: '' }]
  },
  {
    type: 'instagram',
    url: 'https://www.instagram.com/p/CxVSMw7I__x/',
    children: [{ text: '' }]
  },
  {
    type: 'instagram',
    url: 'https://www.instagram.com/p/CUbHfhpswxt/',
    children: [{ text: '' }]
  },
  {
    type: 'facebook',
    url: 'https://www.facebook.com/andrewismusic/posts/451971596293956',
    children: [{ text: '' }]
  },
  {
    type: 'facebook',
    url: 'https://www.facebook.com/photo/?fbid=779946203929812&set=a.537750521482716',
    children: [{ text: '' }]
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: 'youtube',
    id: 'gwOhmYGihUw',
    children: [{ text: '' }]
  },
];