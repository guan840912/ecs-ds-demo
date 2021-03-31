const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.88.0',
  authorName: 'Neil Kuan',
  jsiiFqn: 'projen.AwsCdkTypeScriptApp',
  name: 'ecs-demo',
  cdkDependencies: [
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-ecs-patterns',
    '@aws-cdk/aws-servicediscovery',
  ],
  dependabot: false,
  defaultReleaseBranch: 'main',
});

const ignore = ['venv', '.github/dependabot.yml', 'cdk.context.json'];
project.gitignore.exclude(...ignore);
project.synth();
