'use client';

import { createContext } from 'react';

const ConfigContext = createContext({
   key: "",
   group: "",
   question: "",
   answer: "",
   allowComment: true,
   comment: ""
 });

export default ConfigContext;