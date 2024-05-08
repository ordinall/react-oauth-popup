import React, { useEffect, useState, useRef } from 'react';

type IWindowProps = {
  url: string;
  title: string;
  width: number;
  height: number;
};

type IPopupProps = IWindowProps & {
  onClose: () => void;
  onCode: (code: string, params: URLSearchParams) => void;
  render: ({ onClick }: { onClick: () => void }) => JSX.Element;
  children: React.ReactNode;
};

const createPopup = ({
  url, title, height, width,
}: IWindowProps) => {
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  const externalPopup = window.open(
    url,
    title,
    `width=${width},height=${height},left=${left},top=${top}`,
  );
  return externalPopup;
};

const OauthPopup: (props: IPopupProps) => JSX.Element = ({
  title = '',
  width = 500,
  height = 500,
  url,
  children,
  onCode,
  onClose,
  render,
}: IPopupProps) => {
  const [externalWindow, setExternalWindow] = useState<Window | null>();
  const intervalRef = useRef<number>();

  const clearTimer = () => {
    window.clearInterval(intervalRef.current);
  };

  const onContainerClick = () => {
    setExternalWindow(createPopup({
      url, title, width, height,
    }));
  };
  console.log("running OauthPopup");
  useEffect(() => {
    console.log("running useEffect");
    if (externalWindow) {
      intervalRef.current = window.setInterval(() => {
        try {
          const currentUrl = externalWindow.location.href;
          const params = new URL(currentUrl).searchParams;
          console.log('params', params)
          console.log('currentUrl', currentUrl)
          const code = params.get('code');
          if (!code) {
            return;
          }
          onCode(code, params);
          clearTimer();
          externalWindow.close();
        } catch (error) {
          // eslint-ignore-line
        } finally {
          if (!externalWindow || externalWindow.closed) {
            onClose();
            clearTimer();
          }
        }
      }, 700);
    }
    return () => {
      if (externalWindow) externalWindow.close();
      if (onClose) onClose();
    };
  }, [externalWindow]);

  if (render) {
    return render({ onClick: onContainerClick });
  }

  return (
    // eslint-disable-next-line
    <div
      onClick={() => {
        onContainerClick();
      }}
    >
      { children }
    </div>
  );
};

export default OauthPopup;
