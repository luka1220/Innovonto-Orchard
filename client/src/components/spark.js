import React, { Component } from "react";
import { connect } from "react-redux";
import { setActiveSpark } from "../actions";
import Draggable from "./draggable";
import { sparkColor, borderColor } from "../constants/color";
import { sparkSize } from "./../constants/index.json";
import { H6, LabelIcon, TextnoteIcon, Button } from "../styledComponents";
import primary from "@material-ui/core/colors/amber";

export const renderSparks = (sparks, container, dropZone) => {
  if (!sparks) return null;
  const sparksRender = sparks.map(spark => {
    return (
      <Spark
        container={container}
        dropZone={dropZone ? dropZone : "SPARK" + spark.id}
        key={spark.id}
        data={spark}
      />
    );
  });
  return sparksRender;
};

function ellipsizeTextBox(id) {
  var el = document.getElementById(id);
  if (!el) return undefined;
  var text = el.innerHTML;
  var wordArray = el.innerHTML.split(" ");
  while (el.scrollHeight > el.offsetHeight) {
    wordArray.pop();
    text = wordArray.join(" ") + "...";
    el.innerHTML = text;
  }
  return text;
}

var styles = {
  sparkBox: {
    position: "absolute",
    width: sparkSize.width,
    height: sparkSize.height,
    cursor: "move",
    zIndex: 2,
    background: sparkColor
  },
  inCluster: {
    position: "relative",
    top: 0,
    left: 0,
    float: "left"
  },
  content: {
    padding: "0px 5px",
    fontSize: sparkSize.fontSize,
    maxHeight: sparkSize.contentHeight
  },
  hl: {
    backgroundColor: borderColor,
    padding: 0
  }
};

class Spark extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ellipText: undefined
    };
    this.sparkRef = React.createRef();
  }

  componentDidMount() {
    const text = ellipsizeTextBox("content" + this.props.data.id);
    this.setState({
      ellipText: text
    });
  }
  handleOnClick = ev => {
    const {
      boundSetActiveSpark,
      container,
      data: { id }
    } = this.props;
    boundSetActiveSpark(id, container);
  };

  render() {
    const {
      data: {
        position,
        id,
        content,
        labels,
        textnote,
        title,
        concepts,
        similarities
      },
      container,
      dropZone,
      activeSpark
    } = this.props;
    const { ellipText } = this.state;
    var style = {
      ...styles.sparkBox,
      ...position
    };
    if (container.type === "CLUSTER" || container.type === "STACK") {
      style = { ...style, ...styles.inCluster };
    }

    var text = ellipText ? ellipText : content;
    return (
      <Draggable
        id={id}
        dropZone={dropZone}
        type={"spark"}
        container={container}
        style={style}
        onClick={this.handleOnClick}
      >
        <div>
          <H6 bold={activeSpark === id}>
            {title || "Spark"}
            {labels && labels.length ? <LabelIcon /> : null}
            {textnote ? <TextnoteIcon /> : null}
          </H6>
          <p id={"content" + id} style={styles.content}>
            {(activeSpark === id || similarities) && ellipText
              ? highlighted(concepts, text, similarities)
              : text}
          </p>
        </div>
      </Draggable>
    );
  }
}

const mapStateToProps = state => ({
  activeSpark: state.activeSpark && state.activeSpark.id
});
const mapDispatchToProps = dispatch => ({
  boundSetActiveSpark: (...props) => dispatch(setActiveSpark(...props))
});

Spark = connect(
  mapStateToProps,
  mapDispatchToProps
)(Spark);

export const SparkInfo = ({
  id,
  title,
  labels,
  textnote,
  content,
  removeSpark
}) => {
  return (
    <div>
      <H6>
        {removeSpark ? (
          <Button className="float-left" onClick={() => removeSpark(id)}>
            X
          </Button>
        ) : null}
        {title || "Spark"}
        {labels && labels.length ? <LabelIcon /> : null}
        {textnote ? <TextnoteIcon /> : null}
      </H6>
      <div id={"content" + id}>{content}</div>
    </div>
  );
};
export default Spark;

export const highlighted = (
  concepts,
  content,
  similarities = [],
  style = styles.hl
) => {
  const cWords = concepts.map(c => c.text);
  return content.split(" ").map((e, i) => {
    if (cWords.includes(e)) {
      if (similarities.length > 0) {
        let s = similarities.shift();
        return (
          <span
            key={e + " " + i}
            style={{
              ...style,
              backgroundColor: primary[100 + parseInt(s * 400)]
            }}
          >
            {e + " "}
          </span>
        );
      } else {
        return (
          <span key={e + " " + i} style={style}>
            {e + " "}
          </span>
        );
      }
    } else {
      return e + " ";
    }
  });
};
