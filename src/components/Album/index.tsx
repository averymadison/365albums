import React from 'react';

export interface Props {
  uri: string;
  source: 'spotify' | 'bandcamp';
}

const Album = ({ uri, source }: Props) => (
  <div>
    {uri} {source}
  </div>
);

export default Album;
