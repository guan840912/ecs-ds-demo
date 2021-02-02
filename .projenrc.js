const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.87.1',
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
});

const ignore = ['venv'];
project.gitignore.exclude(...ignore);
project.synth();
