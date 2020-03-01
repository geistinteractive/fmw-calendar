import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { fmFetch } from "fmw-utils";
import {
  Container,
  Row,
  Col,
  Input,
  FormGroup,
  FormText,
  Label,
  Form,
  Button
} from "reactstrap";
import { buildDefaults } from "./utils";

export default function Configurator({ Config, AddonUUID }) {
  const [d, setD] = useState(Config);
  const defaultValues = buildDefaults(Config);

  const { handleSubmit, register, errors, getValues } = useForm({
    defaultValues
  });

  async function scanSchema() {
    const currentData = getValues();
    //clone
    const config = JSON.parse(JSON.stringify(d));
    //add current form state back to config
    Object.keys(config).forEach(key => {
      config[key].value = currentData[key];
    });
    const newConfig = await fmFetch("FCCalendarSchema", config);
    setD(newConfig);
  }

  useEffect(() => {
    scanSchema();
  }, [Config, AddonUUID]);

  const onChange = e => {
    const name = e.target.name;
    const obj = d[name];
    if (obj && obj.reScanOnChange) {
      scanSchema();
    }
  };

  function proper(name) {
    return { register, ...d[name], name, onChange };
  }
  const onSubmit = async data => {
    const config = JSON.parse(JSON.stringify(d));
    Object.keys(config).forEach(key => {
      config[key].value = data[key];
    });

    await fmFetch("FCCalendarSaveConfig", config);
  };
  return (
    <Container fluid>
      <div style={{ height: "20px" }} />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col>
            <span className="config-headers config-headers-lg">
              Calendar Configurator
            </span>
            <p style={{ fontSize: "smaller" }} className="text-muted">
              The calendar addon needs to connect to your database tables. You
              start by choosing the Event Detail Layout. This layout determines
              which table and what fields will be avialable for the calendar.
            </p>
            <p style={{ fontSize: "smaller" }} className="text-muted">
              Next, choose the fields that are specified in each of the Required
              field section. If your table doesn't have one of the fields in
              this section you will need to create it. Make sure you create a
              field of the correct type.
            </p>
            <p style={{ fontSize: "smaller" }} className="text-muted">
              Finally, set any of the optional fields or optional settings that
              you wish to. Click "Save" when you are done.
            </p>
            <p style={{ fontSize: "smaller" }} className="text-muted">
              You can always revert back to the default settings by deleting the
              Calendar Addon from the Layout, and dragging in another one.
            </p>
            <span className="config-headers">Optional Calendar Settings</span>
            <Control {...proper("DefaultEventStyle")}></Control>
            <Row>
              <Col>
                <Control {...proper("StartOnDay")}></Control>
              </Col>
              <Col>
                <Control {...proper("StartingView")}></Control>
              </Col>
            </Row>
          </Col>
          <Col>
            <div style={{ height: "8px" }} />
            <span className="config-headers">Required Fields</span>
            <Control {...proper("EventDetailLayout")}></Control>
            <Control {...proper("EventPrimaryKeyField")}></Control>
            <Control {...proper("EventTitleField")}></Control>
            <Control {...proper("EventStartDateField")}></Control>
            <Control {...proper("EventStartTimeField")}></Control>
            <Control {...proper("EventEndDateField")}></Control>
            <Control {...proper("EventEndTimeField")}></Control>
          </Col>
          <Col>
            <div style={{ height: "8px" }} />
            <span className="config-headers">Optional Fields</span>
            <Control {...proper("EventDescriptionField")}></Control>
            <Control {...proper("EventAllDayField")}></Control>
            <Control {...proper("EventEditableField")}></Control>
            <Control {...proper("EventStyleField")}></Control>
            <span className="config-headers">Optional Calendar Filter</span>
            <p
              style={{ fontSize: "smaller", marginBottom: "0px" }}
              className="text-muted"
            >
              Use the settings below to further filter the events that appear on
              the Calendar.
            </p>
            <Control {...proper("EventFilterField")}></Control>
            <Control {...proper("EventFilterQueryField")}></Control>
          </Col>
        </Row>
        <Button>Save</Button>
      </Form>
    </Container>
  );
}

function Control(props) {
  if (props.type === "select") {
    const opts = Array.isArray(props.options) ? props.options : [];
    const display = props.hidden ? "none" : "";

    let schemaNote = props.fmSchema ? props.fmSchema.type : null;
    if (schemaNote === "Field") {
      schemaNote = props.fmSchema.FieldType + " " + schemaNote;
    }

    return (
      <FormGroup style={{ display }}>
        <span className="schema float-right">{props.rightLabel}</span>
        <Label for={props.name}>{props.label}</Label>
        <Input
          onChange={props.onChange}
          innerRef={props.register}
          bsSize="sm"
          type="select"
          name={props.name}
          id={props.name}
          disabled={props.disabled}
        >
          <option value="">select...</option>
          {opts.map(o => {
            return <option key={o}>{o}</option>;
          })}
        </Input>
        <FormText>{props.help}</FormText>
      </FormGroup>
    );
  }
  return "whoops";
}