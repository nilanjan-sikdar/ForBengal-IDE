import {
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

import {
  createCodingGraph,
} from "../graph/graph.js";

import {
  deductCredits,
} from "../config/deductCredits.js";


// =====================================================
// CREDIT COST
// =====================================================

const CREDIT_COST = {
  plan: 1,
  small_edit: 1,
  debug: 2,
  code: 5,
};


// =====================================================
// TASK CLASSIFIER
// =====================================================

const getTaskType = (message = "") => {

  const text =
    message
      .toLowerCase()
      .trim();


  // ---------------------------------------------------
  // DEBUG
  // ---------------------------------------------------

  if (
    text.includes("fix") ||
    text.includes("error") ||
    text.includes("bug") ||
    text.includes("debug") ||
    text.includes("not working") ||
    text.includes("doesn't work") ||
    text.includes("issue")
  ) {
    return "debug";
  }


  // ---------------------------------------------------
  // SMALL EDIT
  // ---------------------------------------------------

  if (
    text.includes("change") ||
    text.includes("update") ||
    text.includes("modify") ||
    text.includes("rename") ||
    text.includes("remove") ||
    text.includes("add button") ||
    text.includes("change color") ||
    text.includes("change text") ||
    text.includes("make it")
  ) {
    return "small_edit";
  }


  // ---------------------------------------------------
  // NEW PROJECT
  // ---------------------------------------------------

  if (
    text.includes("create") ||
    text.includes("build") ||
    text.includes("make") ||
    text.includes("develop") ||
    text.includes("generate") ||
    text.includes("website") ||
    text.includes("application") ||
    text.includes("app") ||
    text.includes("project")
  ) {
    return "plan";
  }


  // ---------------------------------------------------
  // DEFAULT
  // ---------------------------------------------------

  return "code";
};


// =====================================================
// SSE HELPER
// =====================================================

const sendEvent = (
  res,
  type,
  data
) => {

  if (
    res.writableEnded ||
    res.destroyed
  ) {
    return false;
  }

  try {

    const payload =
      JSON.stringify(
        data ?? {}
      );


    res.write(
      `event: ${type}\n`
    );

    res.write(
      `data: ${payload}\n\n`
    );


    if (
      typeof res.flush ===
      "function"
    ) {
      res.flush();
    }


    return true;

  } catch (error) {

    console.error(
      "SSE SEND ERROR:",
      error
    );

    return false;
  }
};