# Cloudwars

A cloud-based Attack-Defense CTF competition platform. It consists of a Terraform script to deploy the infrastructure on GCP.

## Customization

### Terraform

Values that should be customized are denoted by `CHANGEME` in the Terraform script.

### Packer

This project uses Packer to build a game instance image. The Packer script is located in the `infra/packer` directory. It installs the necessary dependencies and sets up the game instance.
You can also customize Packer script to include your own challenges. (Please refer to the `file` provisioner in the Packer script)

You can run the Packer script using the following command:

```bash
packer build -var-file="variables.pkrvars.hcl" game-instance.pkr.hcl
```
