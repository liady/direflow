import commander, { Command } from 'commander';
import chalk from 'chalk';
import { headline } from './headline';
import { createDireflowSetup } from './create';
import checkForUpdates from './checkForUpdate';
import { showVersion } from './messages';

type IOptions =
  | 'small'
  | 'js'
  | 'ts'
  | 'tslint'
  | 'eslint'
  | 'npm';

type TParsed = Command & { [key in IOptions]?: true } & { desc: string };

export function cli(): void {
  commander
    .command('create [project-name] [description]')
    .alias('c')
    .description('Create a new Direflow Setup')
    .option('-d, --desc <description>', 'Choose JavaScript Direflow Template')
    .option('--js', 'Choose JavaScript Direflow Template')
    .option('--ts', 'Choose TypeScript Direflow Template')
    .option('--tslint', 'Use TSLint for TypeScript Template')
    .option('--eslint', 'Use ESLint for TypeScript Template')
    .option('--npm', 'Make project a NPM Module')
    .action(handleAction);

  commander
    .description(chalk.magenta(headline))
    .version(showVersion())
    .helpOption('-h, --help', 'Show how to use direflow-cli')
    .option('-v, --version', 'Show the current version');

  const [, , simpleArg] = process.argv;

  if (!simpleArg) {
    return commander.help();
  }

  if (['-v', '--version'].includes(simpleArg)) {
    return console.log(checkForUpdates());
  }

  commander.parse(process.argv);
}

async function handleAction(name: string | undefined, description: string | undefined, parsed: TParsed): Promise<void> {
  const { js, ts, tslint, eslint, npm, desc } = parsed;

  let language: 'js' | 'ts' | undefined;
  let linter: 'eslint' | 'tslint' | undefined;

  if (js) {
    language = 'js';
  } else if (ts) {
    language = 'ts';
  }

  if (eslint) {
    linter = 'eslint';
  } else if (tslint) {
    linter = 'tslint';
  }

  await createDireflowSetup({
    name,
    linter,
    language,
    npmModule: !!npm,
    description: description || desc,
  }).catch((err) => {
    console.log('');
    console.log(chalk.red('Unfortunately, something went wrong creating your Direflow Component'));
    console.log(err);
    console.log('');
  });
}
