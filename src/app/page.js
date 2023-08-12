'use client'

import Head from 'next/head';
import AssessmentForm from './components/forms/AssessmentForm'
import ConfigContext from "@/app/contexts/ConfigContext";
import _ from 'lodash'

import {
  Layout,
  Icon
} from 'antd';
import { useState, useEffect } from "react";

const { Header, Content, Footer, Sider } = Layout;


export default function Main() {
  // init config state
  const [config, setConfig] = useState({
    fields: [
      {
        key: "pam-0",
        group: "pam",
        question: "Do you manage privileged accounts using a privileged access management software (PAM)?",
        answer: "",
        allowComment: true,
        comment: ""
      },
      {
        key: "pam-1",
        group: "pam",
        question: "If a PAM solution is deployed, is accessible in a “check-in/out” model?",
        answer: "",
        allowComment: true,
        comment: "",
        dependsOnKey: "pam-0" // hidden until
      },
      {
        key: "mfa-0",
        group: "mfa",
        question: "Do you use MFA to protect all local and remote access to privileged user accounts?",
        answer: "",
        allowComment: false,
        comment: "",
      }
    ],
  })


  return (
    <div>
        <Content>
          <ConfigContext.Provider value={[config, setConfig]}>
            <AssessmentForm />
          </ConfigContext.Provider>
        </Content>
    </div>
  )
}