import React, { useState } from 'react';
import { Image } from 'react-native';

// Imagen segura: usa local `source` si se pasa, o `uri`; cae a fallback si falla
const SafeImage = ({ source, uri, style, resizeMode = 'contain', fallbackSource = require('../assets/icon.png') }) => {
  const [hasError, setHasError] = useState(false);

  let imgSource = fallbackSource;
  if (source) {
    imgSource = source;
  } else if (uri && !hasError) {
    imgSource = { uri };
  }

  return (
    <Image
      source={imgSource}
      style={style}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
    />
  );
};

export default SafeImage;