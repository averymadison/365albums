import React from 'react';

interface Props {
  onlyOneLeft: boolean;
  isEnabled: boolean;
  signInMethod: { id: string; provider: string | null };
  onLink: (provider: string | null) => void;
  onUnlink: (providerId: string) => void;
}

const SocialLoginToggle = ({
  onlyOneLeft,
  isEnabled,
  signInMethod,
  onLink,
  onUnlink
}: Props) =>
  isEnabled ? (
    <button
      type="button"
      onClick={() => onUnlink(signInMethod.id)}
      disabled={onlyOneLeft}
      className="button"
    >
      Unlink {signInMethod.id}
    </button>
  ) : (
    <button
      className="button"
      type="button"
      onClick={() => onLink(signInMethod.provider)}
    >
      Link {signInMethod.id}
    </button>
  );

export default SocialLoginToggle;
