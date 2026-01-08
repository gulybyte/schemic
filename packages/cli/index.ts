import { Command } from "commander";

const program = new Command();

program
  .command("init")
  .description("Initialize a new project")
  .action(() => {
    console.log("Initializing a new project");
  });

program.parse(process.argv);
