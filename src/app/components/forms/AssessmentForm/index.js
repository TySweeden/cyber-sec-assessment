import React, { useContext, useRef, useState, useEffect } from "react";
import _ from 'lodash'
import ConfigContext from "@/app/contexts/ConfigContext";

import {
    Row,
    Col,
    Modal,
    Typography,
    Button,
    Form,
    Input,
    Select,
    Switch,
    Divider,
    Card,
    Space,
} from 'antd';

const { TextArea } = Input;


function AssesmentForm() {
    const [config, setConfig] = useContext(ConfigContext);

    const [open, setOpen] = useState(false);
    const [score, setScore] = useState(0);

    const onValuesChange = (data) => {
        console.log(data)
        if (score > 0) setScore(0)
    }

    const showModal = () => {
        setOpen(true);
    };

    const hideModal = () => {
        setOpen(false);
    };

    const onReset = () => {
        setScore(0)
    }

    const onSubmit = (data) => {
        console.log('SUBMIT DATA', data)

        var formTotalQuestions = _.keys(_.assign([], ..._.values(data)))
        var groupsWithYes = _.filter(_.values(_.assign([], ..._.values(data))), { 'answer': 'yes' })
        //var groupsWithNo =  _.filter( _.values(_.assign([], ..._.values(data))), {'answer': 'no', 'answer': undefined} ) // group NA into NO??

        setScore(_.round(_.divide(groupsWithYes.length, formTotalQuestions.length) * 100))

    }

    return (
        <Row gutter={0} style={{
            minHeight: 300,
            justifyContent: "center"
        }}>
            <Col style={{
                display: "flex",
                justifyContent: "center",
                flex: 1
            }}>
                <Card title="Security Assessment" bordered={false} loading={false} style={{ minWidth: "70%", maxHeight: 800, margin: 20, overflowY: 'auto' }}>
                    <Form.Provider
                        onFormFinish={(name, { values, forms }) => {
                            if (name === 'addQuestionForm') {
                                const { questionsForm } = forms;
                                const questions = questionsForm.getFieldValue('questions') || [];

                                var field = {
                                    key: values.group + '-' + _.size(_.filter(questions, (f) => _.isEqual(f.group, values.group))),
                                    group: "",
                                    question: "",
                                    answer: "",
                                    allowComment: values['allowComment'] === 'yes' ? true : false,
                                    comment: ""
                                }
                                _.assign(field, values)

                                // get last index of group; appending after
                                var index = _.lastIndexOf(questions, field.group)

                                // update form
                                var newFormQuestion = { questions: [..._.slice(questions, 0, index), field, ..._.slice(questions, index, questions.length)] }
                                //console.log(values, newFormQuestion)
                                questionsForm.setFieldsValue(newFormQuestion); // concat to existing form questions

                                // update config - BUG causes added fields to persist after reset !! (:(
                                //var newConfig = { fields: [..._.slice(config.fields, 0, index), field, ..._.slice(config.fields, index, questions.length)] }
                                //console.log(newConfig)
                                //setConfig(newConfig)

                                setOpen(false);
                            }
                        }}
                    >
                        <Form
                            name="questionsForm"
                            onFinish={onSubmit}
                            layout="vertical"
                            size={'default'}
                            onValuesChange={onValuesChange}
                            initialValues={{
                                questions: [...config.fields]
                            }}
                        >
                            <Divider orientation="left">
                                Questions
                            </Divider>

                            <Form.Item
                                label=""
                                shouldUpdate={true}
                            >

                                {({ getFieldValue }) => {
                                    const questions = getFieldValue('questions') || [];

                                    return !questions.length ?
                                        <Typography.Text className="ant-form-text" type="secondary">No cofig data.</Typography.Text>
                                        : _.map(questions, ({
                                            key,
                                            group,
                                            question,
                                            allowComment,
                                            dependsOnKey
                                        }) =>
                                            (dependsOnKey && getFieldValue([group, dependsOnKey, 'answer']) !== "yes") ? // hide
                                                null
                                                : <Row gutter={16} justify={"center"} key={key} >
                                                    <Col span={3} >
                                                        <Form.Item name={[group, key, 'answer']} >
                                                            <Select placeholder="Select" options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={10} >
                                                        <Form.Item name={[group, key, 'comment']} label={question} >
                                                            {allowComment && (getFieldValue([group, key, 'answer']) === "yes") ? <TextArea placeholder={'Comment'} /> : <></>}
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                        )

                                }}
                            </Form.Item>

                            <Row style={{
                                justifyContent: "center",
                                marginBottom: 10
                            }}>
                                <Space>
                                    <Button type="primary" htmlType="submit">Submit</Button>
                                    <Button htmlType="reset" onClick={onReset}>Reset</Button>

                                    <Button htmlType="button" style={{ margin: '0 8px' }} onClick={showModal}>Add Question</Button>
                                </Space>
                            </Row>

                        </Form>

                        <ModalForm open={open} onCancel={hideModal} />

                    </Form.Provider>

                    <Divider orientation="left">
                        Score
                    </Divider>
                    {score}%

                </Card>
            </Col>
        </Row>
    );
}



const ModalForm = ({ open, onCancel }) => {
    const [form] = Form.useForm();
    const [config] = useContext(ConfigContext);
    const [groupOptions, setGroupOptions] = useState([]);
    const [dependOptions, setDependOptions] = useState([]);

    const prevOpenRef = useRef(); // create open ref
    const prevOpen = prevOpenRef.current;

    useEffect(() => {
        prevOpenRef.current = open;
    }, [open]); // init open

    useEffect(() => {
        if (!open && prevOpen) {
            form.resetFields();
        }
    }, [form, prevOpen, open]); // closed - reset

    // build options
    useEffect(() => {
        setGroupOptions(_.uniqBy(_.map(config.fields, (c) => {
            return { value: c.group, label: c.group.toUpperCase() }
        }), 'value'))

    }, [config])

    // build depend options
    useEffect(() => {
        // fix bug ; keep the list up to date with the form fields ; init config is behind
        var options = _.uniqBy(_.map(config.fields, (c) => {
            return { value: c.key, label: c.question }
        }), 'value')

        setDependOptions(options)
    }, [groupOptions])

    const onSelectGroup = (value) => {
        form.resetFields(['dependsOnKey']) // reset ; list has changed
    }

    const onSubmit = () => {
        form.submit();
    };


    return (
        <Modal title="New Question" open={open} onOk={onSubmit} onCancel={onCancel}>
            <Form
                form={form}
                layout="vertical"
                name="addQuestionForm"
            >
                <Form.Item name="group" label="Question Group" rules={[{ required: true, message: 'Missing group' }]}>
                    <Select options={groupOptions} onSelect={onSelectGroup} />
                </Form.Item>

                <Form.Item name="question" label="Question" rules={[{ required: true, message: 'Missing question' }]}>
                    <TextArea />
                </Form.Item>

                <Form.Item name="allowComment" label="Allow Comment" >
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>

                <Form.Item
                    shouldUpdate={true}
                >
                    {({ getFieldValue }) => {
                        const group = getFieldValue('group');
                        return <Form.Item name='dependsOnKey' label="Depends on" >
                            <Select disabled={!group?true:false} options={_.filter(dependOptions, (d) => _.includes(d.value, group))} />
                        </Form.Item>


                    }}
                </Form.Item>

            </Form>
        </Modal>
    );
};


export default AssesmentForm;