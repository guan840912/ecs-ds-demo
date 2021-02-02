import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecsp from '@aws-cdk/aws-ecs-patterns';
import * as ds from '@aws-cdk/aws-servicediscovery';
import { App, Construct, Stack, StackProps, Duration, CfnOutput } from '@aws-cdk/core';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'ecsDemo', { maxAzs: 2, natGateways: 1 });
    const cluster = new ecs.Cluster(this, 'democluster', {
      clusterName: 'democluster',
      vpc,
      defaultCloudMapNamespace: {
        name: 'demo',
      },
    });
    const mocktaskDefinition = new ecs.FargateTaskDefinition(this, 'mocktaskDefinition', {
      cpu: 256,
      memoryLimitMiB: 512,
    });
    const logDriver = new ecs.AwsLogDriver({ streamPrefix: 'mockdata' });
    mocktaskDefinition.addContainer( 'mockdataContainer', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../apps/mockdata')),
      logging: logDriver,
    });
    const mockfargateSG = new ec2.SecurityGroup(this, 'mockfargateSG', {
      securityGroupName: 'mockfargateSG',
      vpc,
    });
    mockfargateSG.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(8080));
    const mockfargate = new ecs.FargateService(this, 'mockfargate2', {
      cluster,
      serviceName: 'mockfargate',
      taskDefinition: mocktaskDefinition,
      assignPublicIp: false,
      cloudMapOptions: {
        cloudMapNamespace: cluster.defaultCloudMapNamespace,
        dnsRecordType: ds.DnsRecordType.A,
        dnsTtl: Duration.seconds(300),
        name: 'mockfargate',
      },
      securityGroups: [mockfargateSG],
    });

    const mockdataUrl = `http://${mockfargate.cloudMapService?.serviceName}.${mockfargate.cloudMapService?.namespace.namespaceName}:8080`;
    new CfnOutput(this, 'mockdataUrl', {
      value: mockdataUrl,
    });
    const apiTaskoption = {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../apps/api')),
      containerPort: 8080,
      containerName: 'api',
      environment: {
        MOCKDATA_SERVER: mockdataUrl,
      },
    };
    const apifargate = new ecsp.ApplicationLoadBalancedFargateService(this, 'api', {
      cluster,
      assignPublicIp: false,
      listenerPort: 80,
      memoryLimitMiB: 512,
      cpu: 256,
      taskImageOptions: apiTaskoption,
      taskSubnets: {
        subnetType: ec2.SubnetType.PRIVATE,
      },
      serviceName: 'api',
      publicLoadBalancer: true,
      desiredCount: 1,
    });
    apifargate.targetGroup.configureHealthCheck({
      path: '/healthcheck',
    });
  }
}

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'ecsdemoDS', { env: devEnv });

app.synth();